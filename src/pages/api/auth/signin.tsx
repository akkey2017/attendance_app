import { signIn } from 'next-auth/react';

const SignIn = () => {
    return (
        <div>
            <h1>Sign In</h1>
            <button onClick={() => signIn('line')}>Sign in with LINE</button>
        </div>
    );
};

export default SignIn;