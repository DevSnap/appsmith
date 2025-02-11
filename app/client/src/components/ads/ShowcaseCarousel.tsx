import React, { useState, useCallback, useEffect } from "react";
import Button, { Category, Size } from "components/ads/Button";

import styled from "styled-components";
import { createMessage, NEXT, BACK, SKIP } from "constants/messages";
import { useTransition, animated } from "react-spring";

const Container = styled.div`
  box-shadow: 1px 0px 10px 5px rgba(0, 0, 0, 0.15);
`;

const Footer = styled.div`
  padding: ${(props) => props.theme.spaces[7]}px;
  justify-content: space-between;
  display: flex;
`;

const Dot = styled.div<{ active: boolean }>`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  margin-right: ${(props) => props.theme.spaces[1]}px;
  background-color: ${(props) =>
    props.active
      ? props.theme.colors.showcaseCarousel.activeStepDot
      : props.theme.colors.showcaseCarousel.inactiveStepDot};
  cursor: pointer;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
`;

const Buttons = styled.div`
  display: flex;
  & button:last-child {
    margin-left: ${(props) => props.theme.spaces[1]}px;
`;

type Step = {
  component: any;
  props: any;
};

export type Steps = Array<Step>;

type Props = {
  steps: Steps;
  activeIndex: number;
};

type DotsProps = {
  count: number;
  activeIndex: number;
  setCurrentIdx: (index: number) => void;
};

function Dots(props: DotsProps) {
  return (
    <Row>
      {Array.from(new Array(props.count)).map((_a, index) => (
        <Dot
          active={index === props.activeIndex}
          key={index}
          onClick={() => props.setCurrentIdx(index)}
        />
      ))}
    </Row>
  );
}

export default function ShowcaseCarousel(props: Props) {
  const { steps } = props;
  const [activeIndex, setCurrentIdx] = useState(props.activeIndex || 0);
  const currentStep = steps[activeIndex];
  const { component: ContentComponent, props: componentProps } = currentStep;
  const length = steps.length;

  useEffect(() => {
    setCurrentIdx(props.activeIndex);
  }, [props.activeIndex]);

  const transition = useTransition("key", null, {
    from: { transform: "translateY(+2%)" },
    enter: { transform: "translateY(0%)" },
    leave: { transform: "translateY(0%)" },
    config: { duration: 300 },
  });

  const handleSubmit = useCallback(() => {
    if (!componentProps.isSubmitDisabled) {
      setCurrentIdx(Math.min(length - 1, activeIndex + 1));
      if (typeof componentProps.onSubmit === "function") {
        componentProps.onSubmit();
      }
    }
  }, [
    componentProps.isSubmitDisabled,
    componentProps.onSubmit,
    activeIndex,
    setCurrentIdx,
    length,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const isEnterKey = e.key === "Enter" || e.keyCode === 13;
      if (isEnterKey) {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <Container onKeyDown={handleKeyDown} tabIndex={0}>
      {transition.map(
        ({ item, props: springProps }: { item: string; props: any }) => (
          <animated.div key={item} style={springProps}>
            <ContentComponent {...componentProps} />
          </animated.div>
        ),
      )}
      <Footer>
        <Dots
          activeIndex={activeIndex}
          count={length}
          setCurrentIdx={setCurrentIdx}
        />
        <Buttons>
          {componentProps.showSkipBtn && (
            <Button
              category={Category.tertiary}
              onClick={componentProps.onSkip}
              size={Size.large}
              tag="button"
              text={createMessage(SKIP)}
            />
          )}
          {!componentProps.hideBackBtn && (
            <Button
              category={Category.tertiary}
              onClick={() => setCurrentIdx(Math.max(0, activeIndex - 1))}
              size={Size.large}
              tag="button"
              text={createMessage(BACK)}
            />
          )}
          <Button
            disabled={componentProps.isSubmitDisabled}
            onClick={handleSubmit}
            size={Size.large}
            tag="button"
            text={componentProps.nextBtnText || createMessage(NEXT)}
            type="submit"
          />
        </Buttons>
      </Footer>
    </Container>
  );
}
