import { lazy } from 'react';
import Cameras from '../pages/Cameras';
import NVR from '../pages/NVR';
import AppSettings from '../pages/AppSetting';
import Blocks from '../pages/Blocks';
import Floors from '../pages/Floors';
import Section from '../pages/Section';
import Student from '../pages/Student';
import NewLogin from '../pages/NewLogin';
import Dashboard from '../pages/Dashboard';
const Index = lazy(() => import('../pages/Index'));

const routes = [
    // dashboard
    {
        path: '/',
        element: <NewLogin />,
        layout: 'blank',
    },
    {
        path: '/dashboard',
        element: <Dashboard />,
        layout: 'default',
    },
    {
        path: '/camera',
        element: <Cameras />,
        layout: 'default',
    },
    {
        path: '/nvr',
        element: <NVR />,
        layout: 'default',
    },
    {
        path: '/appSettings',
        element: <AppSettings />,
        layout: 'default',
    },
    {
        path: '/block',
        element: <Blocks />,
        layout: 'default',
    },
    {
        path: '/floor',
        element: <Floors />,
        layout: 'default',
    },
    {
        path: '/section',
        element: <Section />,
        layout: 'default',
    },
    {
        path: '/student',
        element: <Student />,
        layout: 'default',
    },

];

export { routes };
