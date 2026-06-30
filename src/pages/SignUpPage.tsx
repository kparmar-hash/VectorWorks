import { SignUp } from '@clerk/clerk-react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';

export function SignUpPage() {
  const [params] = useSearchParams();
  const redirectUrl = params.get('redirect_url') || '/modules';

  return (
    <Layout>
      <div className="flex justify-center py-8">
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl={redirectUrl} />
      </div>
    </Layout>
  );
}
