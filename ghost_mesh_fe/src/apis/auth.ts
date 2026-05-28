export const login = async (username: string, password: string): Promise<boolean> => {
  const data = new FormData();
  data.append('username', username);
  data.append('password', password);

  const response = await fetch('http://127.0.0.1:8000/auth/token/', {
    method: 'POST',
    body: data,
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }

  const response_data = await response.json();
  const token = response_data?.access_token;
  
  if (token) {
    document.cookie = `token=${token}; path=/; secure;`;
    return true;
  }
  
  return false;
};

export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const token = document.cookie.split(';').find(row => row.startsWith('token='));
    if (!token) {
      return false;
    } 

    const response = await fetch('http://127.0.0.1:8000/users/me/', {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token.split('=')[1].trim()}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
};


