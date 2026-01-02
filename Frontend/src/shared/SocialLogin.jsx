import { useContext } from "react";
import { AuthProvider } from "../context/ContextProvider.jsx";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FcGoogle } from "react-icons/fc";
import AxiosPublic from "../context/AxiosPublic.jsx";

const SocialLogin = () => {
  const { googleSignIn } = useContext(AuthProvider);
  const navigate = useNavigate();
  const [publicAxios] = AxiosPublic();

  const handleGoogleLogin = () => {
    googleSignIn()
      .then((result) => {
        const user = result.user;
        const userInfo = {
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
          role: "donor",
        };

        publicAxios
          .post("/users", userInfo)
          .then(() => {
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: "Signed in successfully!",
              showConfirmButton: false,
              timer: 1500,
            });
            navigate("/");
          })
          .catch((err) => {
            console.error(
              "Failed to save social user to DB:",
              err?.response?.data || err.message
            );
            // still navigate on social login success; DB failure is non-blocking
            navigate("/");
          });
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Google Login Failed!",
        });
      });
  };

  return (
    <div className="text-center mb-5">
      <button
        onClick={handleGoogleLogin}
        className="btn btn-outline w-3/4 flex justify-center items-center gap-3 mx-auto"
      >
        <FcGoogle className="text-2xl" /> Continue with Google
      </button>
    </div>
  );
};

export default SocialLogin;
