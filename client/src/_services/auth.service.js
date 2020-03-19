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
  try {
    let response = await axios.post(`${process.env.VUE_APP_API_BACKEND}/auth/register`, {
      username: user.username,
      fullname: user.fullname,
      password: user.password
    });
    return response.data;
  } catch (error) {
    throw error;
  }
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

  if (respone.data.token) {
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  return new Error(user);
}

//  Get Profile
async function getProfile() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/me`, {
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
      `${process.env.VUE_APP_API_BACKEND}/me`,
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
    let respone = await axios.put(
      `${process.env.VUE_APP_API_BACKEND}/me/password`,
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
