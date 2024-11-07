// src/components/Scene/hooks/useModelAnimations.ts
import { useCallback, useRef, useState } from 'react';
import { AnimationMixer, AnimationAction, AnimationClip, LoopOnce, Object3D } from 'three';

interface AnimationState {
  mixer: AnimationMixer | null;
  actions: AnimationAction[];
  clips: AnimationClip[];
}

export function useModelAnimations() {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationStateRef = useRef<AnimationState>({
    mixer: null,
    actions: [],
    clips: [],
  });

  const setupAnimations = useCallback((model: Object3D) => {
    console.log('Setting up model animations');
    const animations = (model as any).animations || [];

    if (animations.length > 0) {
      console.log('Found animations:', animations.length);

      const mixer = new AnimationMixer(model);

      const actions = animations.map((clip: AnimationClip) => {
        const action = mixer.clipAction(clip);
        action.setLoop(LoopOnce, 1);
        action.clampWhenFinished = true;
        action.weight = 1;
        return action;
      });

      animationStateRef.current = {
        mixer,
        actions,
        clips: animations,
      };

      // Добавляем обработчик завершения анимаций
      mixer.addEventListener('finished', () => {
        const allFinished = actions.every((action) => action.time >= action.getClip().duration);
        if (allFinished) {
          console.log('All animations finished');
          setIsAnimating(false);
        }
      });

      console.log('Animations setup complete:', {
        totalAnimations: actions.length,
        clipNames: animations.map((clip: AnimationClip) => clip.name),
      });

      return true;
    }

    console.warn('No animations found in model');
    return false;
  }, []);

  const updateAnimations = useCallback(
    (deltaTime: number) => {
      if (isAnimating && animationStateRef.current.mixer) {
        animationStateRef.current.mixer.update(deltaTime);
      }
    },
    [isAnimating]
  );

  const playAnimations = useCallback(() => {
    const { mixer, actions } = animationStateRef.current;

    if (!mixer || actions.length === 0) {
      console.warn('No animations available to play');
      return;
    }

    mixer.stopAllAction();

    actions.forEach((action) => {
      action.reset();
      action.play();
    });

    setIsAnimating(true);
    console.log('Started all animations:', {
      totalPlaying: actions.length,
      animationNames: actions.map((action) => action.getClip().name),
    });
  }, []);

  const pauseAnimations = useCallback(() => {
    const { actions } = animationStateRef.current;

    actions.forEach((action) => {
      action.paused = true;
    });

    setIsAnimating(false);
    console.log('Animations paused');
  }, []);

  const resetAnimations = useCallback(() => {
    const { mixer, actions } = animationStateRef.current;

    if (mixer) {
      mixer.stopAllAction();
      actions.forEach((action) => {
        action.reset();
        action.paused = true;
      });
      setIsAnimating(false);
      console.log('Animations reset');
    }
  }, []);

  const cleanup = useCallback(() => {
    const { mixer } = animationStateRef.current;
    if (mixer) {
      mixer.stopAllAction();
      mixer.uncacheRoot(mixer.getRoot());
      animationStateRef.current = {
        mixer: null,
        actions: [],
        clips: [],
      };
    }
  }, []);

  const getAnimationInfo = useCallback(() => {
    const { clips } = animationStateRef.current;
    const maxDuration = clips.reduce((max, clip) => Math.max(max, clip.duration), 0);

    return {
      totalAnimations: clips.length,
      maxDuration,
      isAnimating,
    };
  }, [isAnimating]);

  return {
    setupAnimations,
    updateAnimations,
    playAnimations,
    pauseAnimations,
    resetAnimations,
    cleanup,
    getAnimationInfo,
    isAnimating,
  };
}
