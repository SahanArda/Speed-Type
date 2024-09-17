const auth = {
  isAuthenticated() {
    return localStorage.getItem("token") !== null;
  },

  setToken(token) {
    localStorage.setItem("token", token);
  },

  getToken() {
    return localStorage.getItem("token");
  },

  setUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
  },

  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export default auth;
