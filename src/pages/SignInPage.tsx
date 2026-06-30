import { SignIn } from '@clerk/clerk-react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';

export function SignInPage() {
  const [params] = useSearchParams();
  const redirectUrl = params.get('redirect_url') || '/modules';

  return (
    <Layout>
      <div className="flex justify-center py-8">
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl={redirectUrl} />
      </div>
    </Layout>
  );
}
