import { environment } from 'src/environments/environment';
import { UserRole } from '../shared/auth.roles';
const adminRoot = environment.adminRoot;

export interface IMenuItem {
  id?: string;
  icon?: string;
  label: string;
  to: string;
  newWindow?: boolean;
  subs?: IMenuItem[];
  roles?: UserRole[];
}

const data: IMenuItem[] = [
  {
    icon: 'iconsminds-air-balloon-1',
    label: 'menu.vien',
    to: `${adminRoot}/vien`,
    roles: [UserRole.Admin, UserRole.Editor],
    subs: [
      {
        icon: 'simple-icon-paper-plane',
        label: 'menu.start',
        to: `${adminRoot}/vien/start`,
        // roles: [UserRole.Admin],
      },
    ],
  },
  {
    icon: 'iconsminds-three-arrow-fork',
    label: 'menu.second-menu',
    to: `${adminRoot}/second-menu`,
    // roles: [UserRole.Editor],
    subs: [
      {
        icon: 'simple-icon-paper-plane',
        label: 'menu.second',
        to: `${adminRoot}/second-menu/second`,
      },
    ],
  },
  {
    icon: 'iconsminds-bucket',
    label: 'menu.blank-page',
    to: `${adminRoot}/blank-page`,
  },
  {
    icon: 'iconsminds-bucket',
    label: 'menu.profile',
    to: `${adminRoot}/profile`,
  },
  {
    icon: 'iconsminds-bucket',
    label: 'menu.create-trip',
    to: `${adminRoot}/create-trip`,
  },
  {
    icon: 'iconsminds-bucket',
    label: 'menu.history',
    to: `${adminRoot}/history`,
  },
  {
    icon: 'iconsminds-bucket',
    label: 'menu.future-request',
    to: `${adminRoot}/future-requests`,
  },
  {
    icon: 'iconsminds-bucket',
    label: 'menu.notification',
    to: `${adminRoot}/notification`,
  },
];
export default data;
