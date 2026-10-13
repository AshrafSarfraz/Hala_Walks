import React from 'react';
import {TouchableOpacity} from 'react-native';
import renderer, {act} from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StaffReceipt from '../components/Modal/StaffModal/RedeemModal';
import TenantReceipt from '../components/Modal/Tenant/RedeemModal2';
import OrganizationReceipt from '../components/Modal/OrgEmp/RedeemModal3';
const mockAdd = jest.fn();
const mockCollection = jest.fn(() => ({add: mockAdd}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));
jest.mock('../firebase/firebaseconfig', () => ({
  firestore: () => ({collection: mockCollection}),
  auth: jest.fn(),
}));
const data: any = {
  nameEng: 'Sample Venue',
  BrandName: 'Sample Venue',
  discount: '25',
  discountText: '25 % Discount',
  code: '',
  createdAt: '',
};
describe('Existing role-specific redemption persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAdd.mockResolvedValue({id: 'receipt'});
  });
  test.each([
    [
      'staff',
      StaffReceipt,
      {staffId: 'S1', userId: 'staff-session'},
      'staff_data',
      'Staff & Family',
    ],
    [
      'tenant',
      TenantReceipt,
      {tenantId: 'T1', id: 'tenant-session'},
      'tenant_data',
      'Husband & Wife',
    ],
    [
      'organization',
      OrganizationReceipt,
      {empId: 'O1', id: 'org-session'},
      'org_emp_data',
      '1 Person Only',
    ],
  ] as const)(
    '%s retains its member/session and selected discount; double taps save once',
    async (_, Component, profile, key, eligibility) => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({...profile, qid: '12345678901'}),
      );
      const close = jest.fn();
      let tree!: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <Component visible data={data} onClose={close} />,
        );
      });
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(key);
      const button = tree.root.findByType(TouchableOpacity);
      await act(async () => {
        const first = button.props.onPress();
        const second = button.props.onPress();
        await Promise.all([first, second]);
      });
      expect(mockCollection).toHaveBeenCalledWith('redeem_history');
      expect(mockAdd).toHaveBeenCalledTimes(1);
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          brandName: 'Sample Venue',
          discount: '25',
          discountText: '25 % Discount',
          eligibility,
          qid: '12345678901',
          employeeId: Object.values(profile)[0],
          userId: Object.values(profile)[1],
          validity: '3 days',
        }),
      );
      expect(close).toHaveBeenCalledTimes(1);
      await act(async () => tree.unmount());
    },
  );
});
