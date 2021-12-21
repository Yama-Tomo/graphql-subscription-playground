import React, { useState } from 'react';
import { Box, Flex, Heading, IconButton, Input } from '@chakra-ui/react';
import { useSignUpMutation } from '@/hooks/api';
import { setUserId } from '@/libs/user';
import { ArrowAltCircleRight } from '@/components/Icons';

type UiProps = {
  name: string;
  onNameChange: JSX.IntrinsicElements['input']['onChange'];
  onSubmit: JSX.IntrinsicElements['form']['onSubmit'];
};
const Ui: React.FC<UiProps> = (props) => (
  <Box
    bg={'brand'}
    height={'100%'}
    display={'flex'}
    flexDirection={'column'}
    justifyContent={'center'}
    alignItems={'center'}
  >
    <Box style={{ marginBottom: '10rem' }} color={'gray.50'}>
      <Heading fontSize={'5xl'} fontWeight={'light'}>
        sign up
      </Heading>
      <Box marginBlockStart={5}>please input your name</Box>
      <form onSubmit={props.onSubmit}>
        <Flex>
          <Input
            type="text"
            value={props.name}
            onChange={props.onNameChange}
            required
            placeholder={'your name'}
            size={'lg'}
            width={'350px'}
          />
          <IconButton
            aria-label="add direct message"
            icon={<ArrowAltCircleRight />}
            colorScheme={'teal'}
            size={'lg'}
            ms={1}
            type={'submit'}
          />
        </Flex>
      </form>
    </Box>
  </Box>
);

type ContainerProps = { onAuthorized: () => void };
const Container: React.FC<ContainerProps> = (props) => {
  const [state, setState] = useState({ name: '' });
  const [signup] = useSignUpMutation();

  const uiProps: UiProps = {
    ...state,
    onNameChange({ target: { value } }) {
      setState((current) => ({ ...current, name: value }));
    },
    onSubmit(e) {
      e.preventDefault();
      signup({ variables: { name: state.name } }).then((res) => {
        if (!res.error && res.data) {
          setUserId(res.data.signup.id);
          props.onAuthorized();
        }
      });
    },
  };

  return <Ui {...uiProps} />;
};

export { Container as SignUp };
