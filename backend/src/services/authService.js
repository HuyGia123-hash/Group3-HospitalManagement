const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const registerUser = async (userData) => {
  const { name, email, password, role } = userData;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('Email đã được sử dụng');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'patient'
  });

  if (user) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    };
  } else {
    throw new Error('Dữ liệu người dùng không hợp lệ');
  }
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    };
  } else {
    throw new Error('Email hoặc mật khẩu không đúng');
  }
};

module.exports = {
  registerUser,
  loginUser,
};
