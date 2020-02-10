module.exports.USER_ROLES = {
  ROLES: [1, 2, 3, 4],
  ADMIN_ACADEMY: 1,
  TEACHER: 2,
  ADMIN_STUDENT: 3,
  STUDENT: 4
};

module.exports.OAUTH_TYPES = {
  TYPES: [0, 1, 2],
  NO: 0,
  GOOGLE: 1,
  FACEBOOK: 2
};

module.exports.STATUS_CERT = {
  STATUS: [0, 1, 2],
  NO_SCORE: 0, // chưa có điểm
  NO_CERT: 1, // có điểm nhưng chưa được cấp chứng chỉ
  CERTIFICATED: 2 // đã được cấp chứng chỉ
};

module.exports.STATUS_REGISTERED = {
  STATUS: [0, 1, 2],
  UNREGISTERED: 0,
  REGISTERED: 1,
  CERTIFICATED: 2
};
