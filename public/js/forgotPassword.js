import axios from 'axios';
import { async } from 'q';
import { showAlert } from './alert';

export const forgotPassword = async (email) => {
  try {
    const result = await axios({
      method: 'POST',
      url: '/api/v1/users/forgotPassword',
      data: {
        email,
      },
    });
    if (result.data.status === 'success') {
      showAlert('success', 'link sent to your email');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
