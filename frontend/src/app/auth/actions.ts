'use server';

import { createClient } from '@/lib/supabase/server';
import { getServerAuthOrigin, sanitizeReturnPath } from '@/lib/auth-redirect';
import { redirect } from 'next/navigation';

type AuthActionState = {
  message?: string;
  success?: boolean;
  redirectTo?: string;
};

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function signIn(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formString(formData, 'email');
  const password = formString(formData, 'password');
  const returnUrl = formString(formData, 'returnUrl');

  if (!email.includes('@')) {
    return { message: 'Please enter a valid email address' };
  }
  if (password.length < 6) {
    return { message: 'Password must be at least 6 characters' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { message: error.message || 'Could not authenticate user' };
  }

  return {
    success: true,
    redirectTo: sanitizeReturnPath(returnUrl),
  };
}

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formString(formData, 'email');
  const password = formString(formData, 'password');
  const confirmPassword = formString(formData, 'confirmPassword');
  const returnUrl = formString(formData, 'returnUrl');

  if (!email.includes('@')) {
    return { message: 'Please enter a valid email address' };
  }
  if (password.length < 6) {
    return { message: 'Password must be at least 6 characters' };
  }
  if (password !== confirmPassword) {
    return { message: 'Passwords do not match' };
  }

  const safeReturnUrl = sanitizeReturnPath(returnUrl);
  const origin = getServerAuthOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?returnUrl=${encodeURIComponent(safeReturnUrl)}`,
    },
  });

  if (error) {
    return { message: error.message || 'Could not create account' };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return {
      message: 'Account created. Check your email to confirm registration.',
    };
  }

  return { success: true, redirectTo: safeReturnUrl };
}

export async function forgotPassword(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formString(formData, 'email');

  if (!email.includes('@')) {
    return { message: 'Please enter a valid email address' };
  }

  const supabase = await createClient();
  const origin = getServerAuthOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?returnUrl=${encodeURIComponent('/auth/reset-password')}`,
  });

  if (error) {
    return { message: error.message || 'Could not send password reset email' };
  }

  return {
    success: true,
    message: 'Check your email for a password reset link',
  };
}

export async function resetPassword(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = formString(formData, 'password');
  const confirmPassword = formString(formData, 'confirmPassword');

  if (password.length < 6) {
    return { message: 'Password must be at least 6 characters' };
  }
  if (password !== confirmPassword) {
    return { message: 'Passwords do not match' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { message: error.message || 'Could not update password' };
  }

  const { error: signOutError } = await supabase.auth.signOut({
    scope: 'global',
  });
  if (signOutError) {
    console.error('Password changed but global sign-out failed:', signOutError);
  }

  return { success: true, message: 'Password updated successfully' };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message || 'Could not sign out');
  }

  redirect('/');
}
