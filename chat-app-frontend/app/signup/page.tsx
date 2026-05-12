"use-client;";
const SignUp = () => {
  return (
    <>
      <section className="w-full h-screen flex items-center justify-center">
        <section className="flex flex-col items-center justify-center gap-6">
          <div
            className="flex flex-col
          "
          >
            <h1 className="text-[50px]">Sign Up</h1>
            <p className="text-[20px]">Create an account to get started</p>
            <label >Name</label>
            <input id="name" type="text" />
            <label >Email</label>
            <input id="email" type="email" />
            <label >Password</label>
            <input id="password" type="password" />
            <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
              Sign Up
            </button>
          </div>
        </section>
      </section>
    </>
  );
};
export default SignUp;
