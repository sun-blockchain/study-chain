export function authHeader() {
  let user = JSON.parse(localStorage.getItem('user'));

  if (user && user.token) {
    return { authorization: user.token };
  } else {
    return {};
  }
}
