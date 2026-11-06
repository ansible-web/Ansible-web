import {
  memo, useEffect, useMemo, useRef,
  useState,
} from '../../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../../global';

import type {
  ApiDiamondTopupOption, ApiUser,
} from '../../../../api/types';
import type { TabState } from '../../../../global/types';

import { getPeerTitle } from '../../../../global/helpers/peers';
import {
  selectUser,
} from '../../../../global/selectors';
import buildClassName from '../../../../util/buildClassName';
import { formatCurrencyAsString } from '../../../../util/formatCurrency';
import renderText from '../../../common/helpers/renderText';

import useCurrentOrPrev from '../../../../hooks/useCurrentOrPrev';
import useLang from '../../../../hooks/useLang';
import useLastCallback from '../../../../hooks/useLastCallback';

import Avatar from '../../../common/Avatar';
import SafeLink from '../../../common/SafeLink';
import Modal from '../../../ui/Modal';
import DiamondTopupOptionList from '../DiamondTopupOptionList';

import styles from './DiamondsGiftModal.module.scss';

import DiamondsBackground from '../../../../assets/diamonds-bg.png';
import DiamondLogo from '../../../../assets/icons/diamond/GoldDiamond.svg';

export type OwnProps = {
  modal: TabState['diamondsGiftModal'];
};

type StateProps = {
  user?: ApiUser;
};

const AVATAR_SIZE = 100;

const DiamondsGiftModal = ({
  modal,
  user,
}: OwnProps & StateProps) => {
  const {
    closeDiamondsGiftModal, openInvoice, requestConfetti,
  } = getActions();
  const dialogRef = useRef<HTMLDivElement>();

  const isOpen = Boolean(modal?.isOpen);

  const renderingModal = useCurrentOrPrev(modal);

  const lang = useLang();

  const [selectedOption, setSelectedOption] = useState<ApiDiamondTopupOption | undefined>();
  const [isHeaderHidden, setIsHeaderHidden] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setIsHeaderHidden(true);
    }
  }, [isOpen]);

  const showConfetti = useLastCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      const {
        top, left, width, height,
      } = dialog.querySelector('.modal-content')!.getBoundingClientRect();
      requestConfetti({
        top,
        left,
        width,
        height,
        withDiamonds: true,
      });
    }
  });

  useEffect(() => {
    if (renderingModal?.isCompleted) {
      showConfetti();
    }
  }, [renderingModal, showConfetti]);

  const handleClick = useLastCallback((option: ApiDiamondTopupOption) => {
    if (!renderingModal) return;

    setSelectedOption(option);
    if (user) {
      openInvoice({
        type: 'starsgift',
        userId: user.id,
        stars: option.stars,
        currency: option.currency,
        amount: option.amount,
      });
    } else {
      openInvoice({
        type: 'stars',
        stars: option.stars,
        currency: option.currency,
        amount: option.amount,
      });
    }
  });

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const { scrollTop } = e.currentTarget;

    setIsHeaderHidden(scrollTop <= 150);
  }

  const handleClose = useLastCallback(() => {
    closeDiamondsGiftModal();
  });

  function renderGiftTitle() {
    if (renderingModal?.isCompleted) {
      return user ? renderText(
        lang(
          'NotificationDiamondsGiftSentYou',
          { amount: formatCurrencyAsString(selectedOption!.amount, selectedOption!.currency, lang.code) },
        ),
        ['simple_markdown'],
      )
        : renderText(
          lang('DiamondsAcquiredInfo', { count: selectedOption!.stars }, { pluralValue: selectedOption!.stars }),
          ['simple_markdown'],
        );
    }

    return user ? lang('GiftDiamondsTitle') : lang('DiamondListGetDiamonds');
  }

  const bottomText = useMemo(() => {
    return lang('CreditsSummaryOptionsAbout', {
      link: <SafeLink url={lang('DiamondsTOSLink')} text={lang('CreditsSummaryOptionsAboutLink')} />,
    }, { withNodes: true });
  }, [lang]);

  return (
    <Modal
      className={buildClassName(styles.modalDialog)}
      contentClassName={styles.content}
      dialogRef={dialogRef}
      isSlim
      onClose={handleClose}
      isOpen={isOpen}
      hasAbsoluteCloseButton
    >
      <div className={buildClassName(styles.main, 'custom-scroll')} onScroll={handleScroll}>
        <div className={buildClassName(styles.header, isHeaderHidden && styles.hiddenHeader)}>
          <h2 className={styles.diamondHeaderText}>
            {user ? lang('GiftDiamondsTitle') : lang('DiamondListGetDiamonds')}
          </h2>
        </div>
        <div className={styles.headerInfo}>
          {user ? (
            <>
              <Avatar
                size={AVATAR_SIZE}
                peer={user}
                className={styles.avatar}
              />
              <img className={styles.logoBackground} src={DiamondsBackground} alt="" draggable={false} />
            </>
          ) : (
            <>
              <img className={styles.logo} src={DiamondLogo} alt="" draggable={false} />
              <img className={styles.logoBackground} src={DiamondsBackground} alt="" draggable={false} />
            </>
          )}
        </div>
        <h2 className={buildClassName(styles.headerText, styles.center)}>
          {renderGiftTitle()}
        </h2>
        <p className={styles.description}>
          {user ? renderText(
            lang('ActionGiftDiamondsSubtitle', { peer: getPeerTitle(lang, user) }), ['simple_markdown'],
          ) : lang('DiamondsPurchaseGetDiamondsInfo')}
        </p>
        <div className={styles.section}>
          <DiamondTopupOptionList
            options={renderingModal?.diamondsGiftOptions}
            onClick={handleClick}
          />
          <div className={styles.secondaryInfo}>
            {bottomText}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default memo(withGlobal<OwnProps>((global, { modal }): Complete<StateProps> => {
  const user = modal?.forUserId ? selectUser(global, modal.forUserId) : undefined;

  return {
    user,
  };
})(DiamondsGiftModal));
