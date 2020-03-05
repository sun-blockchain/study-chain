import axios from 'axios';
import { authHeader } from '../_helpers/auth-header.js';

export const authService = {
  login,
  register,
  logout,
  loginGoogle,
  getProfile,
  pushProfile,
  changePass
};

async function login(username, password) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/auth/login`,
      {
        username: username,
        password: password
      },
      { 'content-type': 'application/x-www-form-urlencoded' }
    );
    let user = respone.data;
    if (respone.data.success) {
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    return null;
  } catch (error) {
    throw error;
  }
}

async function register(user) {
  let response = await axios.post(`${process.env.VUE_APP_API_BACKEND}/auth/register`, {
    username: user.username,
    fullname: user.fullname,
    password: user.password
  });
  return handleResponse(response);
}

async function logout() {
  localStorage.removeItem('user');
  location.reload(true);
}

async function loginGoogle(code) {
  let respone = await axios.get(
    `${process.env.VUE_APP_API_BACKEND}/auth/google/callback?code=` + code,
    {
      'content-type': 'application/x-www-form-urlencoded'
    }
  );

  let user = await handleResponse(respone);
  if (user.token) {
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  return new Error(user);
}

//  Get Profile
async function getProfile() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/account/me`, {
      headers: authHeader()
    });
    let {
      username,
      fullname,
      phonenumber,
      email,
      address,
      sex,
      birthday,
      avatar,
      country
    } = respone.data;
    let student = {
      username,
      fullname,
      phonenumber,
      email,
      address,
      sex,
      birthday,
      avatar,
      country
    };
    return student;
  } catch (error) {
    throw error;
  }
}

//  Get Profile
async function pushProfile(user) {
  try {
    let respone = await axios.put(
      `${process.env.VUE_APP_API_BACKEND}/account/me/info`,
      {
        username: user.username,
        fullName: user.fullname,
        phoneNumber: { value: user.phonenumber.replace(/\s+/g, ''), country: user.country },
        email: user.email,
        address: user.address,
        birthday: user.birthday,
        sex: user.sex
      },
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}

//  change password
async function changePass(changePass) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/account/me/changePassword`,
      {
        oldPass: changePass.oldPass,
        newPass: changePass.newPass,
        confirmPass: changePass.confirmPass
      },
      {
        headers: authHeader()
      }
    );
    return respone.data;
  } catch (error) {
    throw error;
  }
}

async function handleResponse(response) {
  return new Promise((resolve, reject) => {
    let data = response.data;
    if (response.status === 200) {
      if (data.success) {
        resolve(data);
      } else {
        reject(data.msg);
      }
      if (errors) {
        reject(errors);
      }
    } else if (response.status === 401) {
      logout();
      location.reload(true);
    } else {
      const error = (data && data.msg) || response.statusText;
      reject(error);
    }
  });
}
