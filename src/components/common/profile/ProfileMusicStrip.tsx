import type React from '../../../lib/teact/teact';
import { memo, useEffect, useState } from '../../../lib/teact/teact';

import type { ApiAudio } from '../../../api/types';

import { getMediaFormat, getMediaHash } from '../../../global/helpers';
import { makeSavedMusicTrackId } from '../../../util/audioPlayer';
import buildClassName from '../../../util/buildClassName';
import renderText from '../helpers/renderText';

import useAudioPlayer from '../../../hooks/useAudioPlayer';
import useBuffering from '../../../hooks/useBuffering';
import useLastCallback from '../../../hooks/useLastCallback';
import useMedia from '../../../hooks/useMedia';

import Icon from '../icons/Icon';

import styles from './ProfileMusicStrip.module.scss';

type OwnProps = {
  audio: ApiAudio;
  className?: string;
  style?: string;
};

// Полоса музыки профиля: трек из userFull.saved_music строкой под именем.
//
// Апстрим открывает по нажатию отдельную модалку плейлиста, которая стоит на его
// новой подсистеме проигрывания (`util/audioPlayback/*`, `useAudioPlayback`,
// селекторы плеера). У нас этой подсистемы нет — плеер прежний, поэтому полоса
// играет трек нашим `useAudioPlayer` с источником `savedMusic`, тем же, что и
// вкладка «Плейлист» (`common/ProfileMusic.tsx`). Весь список по-прежнему живёт на
// вкладке, а полоса даёт то, за чем она и нужна: видно, какой трек в профиле, и
// его можно послушать одним нажатием.
const ProfileMusicStrip = ({ audio, className, style }: OwnProps) => {
  const [isActivated, setIsActivated] = useState(false);

  const mediaData = useMedia(getMediaHash(audio, 'inline'), !isActivated, getMediaFormat(audio, 'inline'));
  const { bufferingHandlers, checkBuffering } = useBuffering();

  const handleForcePlay = useLastCallback(() => {
    setIsActivated(true);
  });

  const handleTrackChange = useLastCallback(() => {
    setIsActivated(false);
  });

  const { isPlaying, playPause } = useAudioPlayer(
    makeSavedMusicTrackId(audio),
    audio.duration,
    'savedMusic',
    mediaData,
    bufferingHandlers,
    undefined,
    checkBuffering,
    isActivated,
    handleForcePlay,
    handleTrackChange,
    // Убрать трек из плейлиста при размонтировании: в плейлисте остаётся только
    // то, что показано сейчас (так же, как во вкладке «Плейлист»).
    true,
  );

  useEffect(() => {
    setIsActivated(isPlaying);
  }, [isPlaying]);

  const handleClick = useLastCallback(() => {
    setIsActivated(!isActivated);
    playPause();
  });

  const handleKeyDown = useLastCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;

    e.preventDefault();
    handleClick();
  });

  const title = renderText(audio.title || audio.fileName);

  return (
    <div className={buildClassName(styles.root, className)} style={style}>
      <div
        className={styles.strip}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <Icon name="profile-music" className={styles.icon} />
        {Boolean(audio.performer) && (
          <span className={styles.performer}>{renderText(audio.performer)}</span>
        )}
        {Boolean(audio.performer) && <span className={styles.separator}>-</span>}
        <span className={styles.title}>{title}</span>
        <Icon name={isPlaying ? 'pause' : 'play'} className={styles.icon} />
      </div>
    </div>
  );
};

export default memo(ProfileMusicStrip);
