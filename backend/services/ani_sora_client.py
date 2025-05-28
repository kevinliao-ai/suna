"""
AniSora API 客户端

这个模块提供了与 AniSora API 交互的客户端类，用于生成图像到视频的转换。
"""
import os
import logging
import time
from typing import Dict, List, Optional, Tuple, Union, Literal
from pathlib import Path
from enum import Enum

import requests
from gradio_client import Client, handle_file

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 类型别名
SpeedType = Literal['原版', '加速版']

class AniSoraError(Exception):
    """AniSora API 异常基类"""
    pass

class VideoGenerationError(AniSoraError):
    """视频生成错误"""
    pass

class InvalidInputError(AniSoraError):
    """无效输入错误"""
    pass

class AniSoraClient:
    """
    AniSora API 客户端类，用于与 AniSora 服务交互。
    
    属性:
        client: Gradio 客户端实例
        api_url: API 基础 URL
        timeout: 请求超时时间（秒）
    """
    
    def __init__(
        self, 
        api_url: str = "https://bilibili-index-anisora.ms.show/",
        timeout: int = 300,
        max_retries: int = 3,
        retry_delay: int = 5
    ):
        """
        初始化 AniSora 客户端
        
        Args:
            api_url: AniSora API 的基础 URL
            timeout: 请求超时时间（秒）
            max_retries: 最大重试次数
            retry_delay: 重试延迟时间（秒）
        """
        self.api_url = api_url.rstrip('/')
        self.timeout = timeout
        self.max_retries = max(retries, 1)
        self.retry_delay = max(retry_delay, 1)
        
        logger.info(f"正在初始化 AniSora 客户端，API URL: {self.api_url}")
        self.client = Client(api_url)
    
    def _validate_inputs(
        self,
        prompt: str,
        image_path: str,
        duration: float,
        speed: SpeedType,
        motion: float
    ) -> None:
        """验证输入参数"""
        if not prompt or len(prompt.strip()) == 0:
            raise InvalidInputError("提示词不能为空")
            
        if len(prompt) > 200 * 5:  # 假设平均每个单词5个字符
            raise InvalidInputError("提示词过长，请控制在200个单词以内")
            
        if not image_path:
            raise InvalidInputError("图片路径不能为空")
            
        if not (0.1 <= duration <= 10.0):
            raise InvalidInputError("视频时长必须在0.1到10秒之间")
            
        if speed not in ['原版', '加速版']:
            raise InvalidInputError("速度参数必须是'原版'或'加速版'")
            
        if not (0.1 <= motion <= 2.0):
            raise InvalidInputError("运动幅度必须在0.1到2.0之间")
    
    def _download_file(self, url: str, save_path: Union[str, Path]) -> str:
        """
        下载文件到本地
        
        Args:
            url: 文件URL
            save_path: 保存路径
            
        Returns:
            str: 保存的文件路径
        """
        save_path = Path(save_path)
        save_path.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            response = requests.get(url, stream=True, timeout=self.timeout)
            response.raise_for_status()
            
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            
            return str(save_path.absolute())
        except Exception as e:
            logger.error(f"下载文件失败: {e}")
            raise AniSoraError(f"下载文件失败: {e}")
    
    def generate_video(
        self,
        prompt: str,
        image_path: Union[str, Path],
        seed: int = 233,
        duration: float = 5.0,
        speed: SpeedType = "加速版",
        motion: float = 1.3,
    ) -> Dict[str, Union[str, float]]:
        """
        生成视频
        
        Args:
            prompt: 提示词，不超过200个单词
            image_path: 输入图像的本地路径或URL
            seed: 随机种子，-1 表示随机
            duration: 视频时长（秒），范围0.1-10.0
            speed: 处理速度，可选 "原版" 或 "加速版"
            motion: 运动幅度，值越大运动越剧烈，范围0.1-2.0
            
        Returns:
            dict: 包含生成结果的字典，包含以下键：
                - video_path: 视频文件路径
                - subtitle_path: 字幕文件路径（如果有）
                - download_path: 下载视频的路径
                - seed_used: 使用的种子值
                - duration: 视频时长
                
        Raises:
            InvalidInputError: 输入参数无效
            VideoGenerationError: 视频生成失败
            AniSoraError: 其他API错误
        """
        self._validate_inputs(prompt, image_path, duration, speed, motion)
        
        # 如果是URL，下载到临时文件
        if isinstance(image_path, str) and image_path.startswith(('http://', 'https://')):
            logger.info(f"从URL下载图片: {image_path}")
            temp_file = Path(f"temp_{int(time.time())}.jpg")
            try:
                image_path = self._download_file(image_path, temp_file)
                logger.info(f"图片已保存到: {image_path}")
            except Exception as e:
                raise VideoGenerationError(f"下载图片失败: {e}")
        
        last_error = None
        
        for attempt in range(self.max_retries):
            try:
                logger.info(f"开始生成视频 (尝试 {attempt + 1}/{self.max_retries})")
                logger.debug(f"参数: prompt={prompt[:50]}..., seed={seed}, duration={duration}, speed={speed}, motion={motion}")
                
                # 处理输入图像
                img = handle_file(str(image_path))
                
                # 调用 API
                result = self.client.predict(
                    prompt=prompt,
                    img=img,
                    seed=seed,
                    nf=duration,
                    speed=speed,
                    motion=motion,
                    api_name="/generate_i2v"
                )
                
                # 解析结果
                if not result or len(result) < 3:
                    raise VideoGenerationError("API返回结果格式错误")
                
                video_info, download_path, seed_used = result
                
                if not video_info or 'video' not in video_info:
                    raise VideoGenerationError("生成的视频信息不完整")
                
                # 构建返回结果
                return {
                    'video_path': video_info['video'],
                    'subtitle_path': video_info.get('subtitles'),
                    'download_path': download_path,
                    'seed_used': seed_used,
                    'duration': duration
                }
                
            except Exception as e:
                last_error = e
                logger.warning(f"视频生成失败 (尝试 {attempt + 1}/{self.max_retries}): {e}")
                
                if attempt < self.max_retries - 1:
                    wait_time = self.retry_delay * (attempt + 1)
                    logger.info(f"{wait_time}秒后重试...")
                    time.sleep(wait_time)
        
        # 所有重试都失败
        error_msg = f"视频生成失败，已达到最大重试次数 ({self.max_retries}): {str(last_error)}"
        logger.error(error_msg)
        raise VideoGenerationError(error_msg) from last_error
    
    def generate_video_from_url(
        self,
        prompt: str,
        image_url: str,
        seed: int = 233,
        duration: float = 5.0,
        speed: SpeedType = "加速版",
        motion: float = 1.3,
    ) -> Dict[str, Union[str, float]]:
        """
        从URL生成视频
        
        Args:
            prompt: 提示词，不超过200个单词
            image_url: 输入图像的URL
            seed: 随机种子，-1 表示随机
            duration: 视频时长（秒），范围0.1-10.0
            speed: 处理速度，可选 "原版" 或 "加速版"
            motion: 运动幅度，值越大运动越剧烈，范围0.1-2.0
            
        Returns:
            dict: 包含生成结果的字典，包含以下键：
                - video_path: 视频文件路径
                - subtitle_path: 字幕文件路径（如果有）
                - download_path: 下载视频的路径
                - seed_used: 使用的种子值
                - duration: 视频时长
                
        Raises:
            InvalidInputError: 输入参数无效
            VideoGenerationError: 视频生成失败
            AniSoraError: 其他API错误
        """
        logger.info(f"从URL生成视频: {image_url}")
        return self.generate_video(
            prompt=prompt,
            image_path=image_url,
            seed=seed,
            duration=duration,
            speed=speed,
            motion=motion
        )


def main():
    """主函数，演示如何使用 AniSoraClient"""
    import argparse
    
    # 设置命令行参数
    parser = argparse.ArgumentParser(description='AniSora 视频生成工具')
    subparsers = parser.add_subparsers(dest='command', help='子命令')
    
    # 生成视频命令
    gen_parser = subparsers.add_parser('generate', help='生成视频')
    gen_parser.add_argument('prompt', help='提示词，描述你想要的视频内容')
    gen_parser.add_argument('image_path', help='输入图像的本地路径或URL')
    gen_parser.add_argument('--seed', type=int, default=233, help='随机种子，-1表示随机')
    gen_parser.add_argument('--duration', type=float, default=5.0, help='视频时长（秒）')
    gen_parser.add_argument('--speed', choices=['原版', '加速版'], default='加速版', help='处理速度')
    gen_parser.add_argument('--motion', type=float, default=1.3, help='运动幅度，值越大运动越剧烈')
    gen_parser.add_argument('--api-url', default='https://bilibili-index-anisora.ms.show/', help='API基础URL')
    
    args = parser.parse_args()
    
    # 设置日志级别
    logging.basicConfig(level=logging.INFO)
    
    if args.command == 'generate':
        try:
            # 创建客户端
            client = AniSoraClient(api_url=args.api_url)
            
            # 生成视频
            start_time = time.time()
            print(f"开始生成视频，请稍候...")
            
            result = client.generate_video(
                prompt=args.prompt,
                image_path=args.image_path,
                seed=args.seed,
                duration=args.duration,
                speed=args.speed,
                motion=args.motion
            )
            
            # 输出结果
            elapsed = time.time() - start_time
            print("\n🎉 视频生成成功!")
            print(f"- 耗时: {elapsed:.2f}秒")
            print(f"- 视频文件: {result['video_path']}")
            if result['subtitle_path']:
                print(f"- 字幕文件: {result['subtitle_path']}")
            print(f"- 下载路径: {result['download_path']}")
            print(f"- 使用的种子: {result['seed_used']}")
            print(f"- 视频时长: {result['duration']}秒")
            
        except AniSoraError as e:
            print(f"\n❌ 错误: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        parser.print_help()

if __name__ == "__main__":
    import sys
    main()
