import axios from 'axios';
import { async } from 'q';
import { showAlert } from './alert';

export const resetPassword = async (password, passwordConfirm) => {
  const token = window.location.pathname.split('/').pop();
  try {
    const result = await axios({
      method: 'PATCH',
      url: `/api/v1/users/resetPassword/${token}`,
      data: {
        password,
        passwordConfirm,
      },
    });

    if (result.data.status === 'success') {
      showAlert('success', 'password changed successfully');
      setTimeout(() => {
        location.assign('/login');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
