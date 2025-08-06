import axios from 'axios';
import { async } from 'q';
import { showAlert } from './alert';

export const verifyCode = async (code) => {
  try {
    const result = await axios({
      method: 'POST',
      url: '/api/v1/users/signup/verify',
      data: {
        code,
      },
    });
    if (result.data.status === 'success') {
      showAlert('success', 'you sign up successfully');
      setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
