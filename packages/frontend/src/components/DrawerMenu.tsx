import {
  IconButtonProps,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import React from 'react';

import { Channels, ChannelsProps } from '@/components/Channels';
import { CardList } from '@/components/Icons';

type UiProps = {
  buttonStyleProps?: Omit<IconButtonProps, 'aria-label'>;
  onOpen: () => void;
  isOpen: boolean;
  onClose: () => void;
} & ChannelsProps;
const Ui = React.forwardRef<HTMLButtonElement, UiProps>(
  ({ isOpen, onOpen, onClose, buttonStyleProps = {}, ...rest }, ref) => (
    <>
      <IconButton
        ref={ref}
        onClick={onOpen}
        bg={'white'}
        aria-label="open drawer"
        {...buttonStyleProps}
      >
        <CardList />
      </IconButton>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement="left"
        finalFocusRef={typeof ref != 'function' && ref != null ? ref : undefined}
      >
        <DrawerOverlay>
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader />
            <DrawerBody>
              <Channels {...rest} />
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </>
  )
);

Ui.displayName = 'DrawerUi';

type ContainerProps = Omit<UiProps, 'onOpen' | 'isOpen' | 'onClose'>;
const Container: React.FC<ContainerProps> = (props) => {
  const disclosure = useDisclosure();
  const btnRef = React.useRef<HTMLButtonElement>(null);

  const uiProps: UiProps = {
    ...props,
    ...disclosure,
  };

  return <Ui {...uiProps} ref={btnRef} />;
};

export { Container as DrawerMenu };
export type { ContainerProps as DrawerMenuProps };
