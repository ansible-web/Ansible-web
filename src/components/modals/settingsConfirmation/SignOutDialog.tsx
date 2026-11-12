import { memo } from '../../../lib/teact/teact';
import { getActions } from '../../../global';

import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';

import ConfirmDialog from '../../ui/ConfirmDialog';

type OwnProps = {
  isOpen: boolean;
  onClose: NoneToVoidFunction;
};

const SignOutDialog = ({ isOpen, onClose }: OwnProps) => {
  const { signOut } = getActions();
  const lang = useLang();
  const handleConfirm = useLastCallback(() => {
    onClose();
    signOut({ forceInitApi: true });
  });

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      text={lang('SureLogout')}
      confirmLabel={lang('AccountSettingsLogout')}
      confirmHandler={handleConfirm}
      confirmIsDestructive
    />
  );
};

export default memo(SignOutDialog);
