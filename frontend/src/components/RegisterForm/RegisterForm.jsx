import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import axios from "axios";
import auth from "../../services/auth";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const validationSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    passwordConfirmation: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const handleSubmit = async (values) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/register",
        values
      );
      const { access_token, user } = response.data;

      auth.setToken(access_token);
      auth.setUser(user);

      navigate("/");
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message); // Set specific error message from the backend
      } else {
        setError("Registration failed, please try again.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Register
        </h2>

        {error && <div className="text-red-500 text-center">{error}</div>}

        <Formik
          initialValues={{
            username: "",
            email: "",
            password: "",
            passwordConfirmation: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-gray-700">Username</label>
                <Field
                  type="text"
                  name="username"
                  className="w-full p-2 mt-1 border rounded-md border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-700">Email</label>
                <Field
                  type="email"
                  name="email"
                  className="w-full p-2 mt-1 border rounded-md border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-700">Password</label>
                <Field
                  type="password"
                  name="password"
                  className="w-full p-2 mt-1 border rounded-md border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-700">Confirm Password</label>
                <Field
                  type="password"
                  name="passwordConfirmation"
                  className="w-full p-2 mt-1 border rounded-md border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                />
                <ErrorMessage
                  name="passwordConfirmation"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Account..." : "Register"}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <div className="text-center">
          <Link to="/" className="text-purple-600 hover:underline">
            Already have an account? Login here.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
