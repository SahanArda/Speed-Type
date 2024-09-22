import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import axios from "axios";
import auth from "../../services/auth";

const LoginForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const handleSubmit = async (values) => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/login", values);
      const { access_token, user } = response.data;
  
      // Use auth to manage token and user
      auth.setToken(access_token);
      auth.setUser(user);
  
      navigate("/home");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-navy">
      <div className="w-full max-w-md p-8 space-y-6 bg-light-navy rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-lightest-slate">Login</h2>

        {error && <div className="text-red-500 text-center">{error}</div>}

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-lightest-slate">Email</label>
                <Field
                  type="email"
                  name="email"
                  className="w-full p-2 mt-1 border rounded-md border-slate focus:ring-green focus:border-green bg-light-navy text-light-slate"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-lightest-slate">Password</label>
                <Field
                  type="password"
                  name="password"
                  className="w-full p-2 mt-1 border rounded-md border-slate focus:ring-green focus:border-green bg-light-navy text-light-slate"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 mt-3 font-bold text-navy bg-green rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-green"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <div className="text-center">
          <Link to="/register" className="text-green hover:underline">
            Don&apos;t have an account? Register here.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
