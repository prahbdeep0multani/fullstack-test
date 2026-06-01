import { useContext } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Layout } from 'antd';

import AppContext from '../helpers/AppContext';

import AuthContext, { AuthStatus } from '../helpers/core/AuthContext';

import ErrorPage from '../components/core/extra/ErrorPage';
import FullpageLoading from '../components/core/extra/FullpageLoading';
import Sidebar from '../components/core/layout/Sidebar';

import LoginRegister from '../components/core/user/LoginRegister';
import ChangePassword from '../components/core/user/ChangePassword';
import Home from './Home';
import Entries from './Entries';
import Collaborators from './Collaborators';

import AuthRoute from '../components/routes/AuthRoute';
import GuestRoute from '../components/routes/GuestRoute';

const { Content } = Layout;

const Index = () => {
  const { authStatus } = useContext(AuthContext);
  const { isMobile } = useContext(AppContext);

  if (authStatus === AuthStatus.Loading) return <FullpageLoading />;

  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <Layout className="min-h-[100vh]">
          <AuthRoute outlet={false}>
            <Layout>
              <Sidebar />
              <Content className={isMobile ? 'pt-[52px]' : ''}>
                <Outlet />
              </Content>
            </Layout>
          </AuthRoute>
        </Layout>
      ),
      children: [
        { path: '/', index: true, element: <Home /> },
        { path: '/entries', element: <Entries /> },
        { path: '/collaborators', element: <Collaborators /> }
      ]
    },
    {
      path: '/',
      errorElement: <ErrorPage status="404" />,
      element: (
        <Layout className="min-h-[100vh]">
          <Content>
            <Outlet />
          </Content>
        </Layout>
      ),
      children: [
        {
          path: 'login',
          element: (
            <GuestRoute outlet={false}>
              <LoginRegister />
            </GuestRoute>
          )
        },
        {
          path: '/changePassword/:email/:token',
          element: (
            <GuestRoute forceLogout outlet={false}>
              <ChangePassword />
            </GuestRoute>
          )
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />;
};

export default Index;
