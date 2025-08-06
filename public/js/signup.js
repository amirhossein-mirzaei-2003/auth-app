import axios from 'axios';
import { async } from 'q';
import { showAlert } from './alert';

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const result = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });

    if (result.data.status === 'success') {
      location.assign('/verificationCode');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
