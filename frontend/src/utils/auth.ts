export const verifyEmail = async (token: string): Promise<void> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token })
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.details || 'Verification failed');
  }

  return response.json();
}; 