import { useEffect, useRef, useState } from '../../../../lib/teact/teact';
import { getActions, getGlobal } from '../../../../global';

import { PAID_MESSAGES_PURPOSE } from '../../../../config';
import { selectTabState } from '../../../../global/selectors';

import useLastCallback from '../../../../hooks/useLastCallback';

export default function usePaidMessageConfirmation(
  dialogKey: string,
  diamondsForAllMessages: number,
  isDiamondsBalanceModeOpen: boolean,
  diamondsBalance: number,
  shouldDelayConfirmHandler?: boolean,
) {
  const {
    shouldPaidMessageAutoApprove,
  } = getGlobal().settings.byKey;

  const [shouldAutoApprove, setShouldAutoApprove] = useState(Boolean(shouldPaidMessageAutoApprove));
  const [isWaitingDiamondsTopup, setIsWaitingDiamondsTopup] = useState(false);
  const confirmPaymentHandlerRef = useRef<NoneToVoidFunction | undefined>(undefined);

  const closeConfirmDialog = useLastCallback(() => {
    getActions().closePaymentMessageConfirmDialogOpen();
  });

  useEffect(() => {
    return () => {
      const { paymentMessageConfirmDialogKey } = selectTabState(getGlobal());
      if (paymentMessageConfirmDialogKey === dialogKey) {
        getActions().closePaymentMessageConfirmDialogOpen();
      }
    };
  }, [dialogKey]);

  useEffect(() => {
    if (isWaitingDiamondsTopup && !isDiamondsBalanceModeOpen) {
      setIsWaitingDiamondsTopup(false);

      if (diamondsBalance > diamondsForAllMessages) {
        confirmPaymentHandlerRef?.current?.();
      }
    }
  }, [isWaitingDiamondsTopup, isDiamondsBalanceModeOpen, diamondsBalance, diamondsForAllMessages]);

  const handleDiamondsTopup = useLastCallback(() => {
    getActions().openDiamondsBalanceModal({
      topup: {
        balanceNeeded: diamondsForAllMessages,
        purpose: PAID_MESSAGES_PURPOSE,
      },
    });
    setIsWaitingDiamondsTopup(true);
  });

  const dialogHandler = useLastCallback(() => {
    if (diamondsForAllMessages > diamondsBalance) {
      handleDiamondsTopup();
    } else if (shouldDelayConfirmHandler) {
      setTimeout(() => {
        confirmPaymentHandlerRef?.current?.();
      }, 250);
    } else {
      confirmPaymentHandlerRef?.current?.();
    }

    getActions().closePaymentMessageConfirmDialogOpen();
    if (shouldAutoApprove) getActions().setPaidMessageAutoApprove();
  });

  const handleWithConfirmation = useLastCallback(<T extends (...args: any[]) => void>(
    handler: T,
    ...args: Parameters<T>
  ) => {
    if (diamondsForAllMessages) {
      confirmPaymentHandlerRef.current = () => handler(...args);
      if (!shouldPaidMessageAutoApprove) {
        getActions().openPaymentMessageConfirmDialogOpen({ dialogKey });
        return;
      }

      if (diamondsForAllMessages > diamondsBalance) {
        handleDiamondsTopup();
        return;
      }
    }

    handler(...args);
  });

  return {
    closeConfirmDialog,
    handleWithConfirmation,
    dialogHandler,
    shouldAutoApprove,
    setAutoApprove: setShouldAutoApprove,
  };
}
