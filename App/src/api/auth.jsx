import { baseURL } from '../constants/index.js';

// Signup Fetch
export const signupApi = async (formData) => {
    const response = await fetch(`${baseURL}/signup`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(formData)
      })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message)
    }
    return response.json();
}

// Login Fetch
export const loginApi = async (formData) => {
    const response = await fetch(`${baseURL}/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(formData)
    })
    if (!response.ok) {
    const errorData = await response.json();
      throw new Error(errorData.message);
    }
    return response.json();
  }