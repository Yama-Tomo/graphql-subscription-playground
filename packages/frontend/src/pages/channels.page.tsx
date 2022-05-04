import { Box } from '@chakra-ui/react';
import { NextPage } from 'next';
import React from 'react';
import { gql } from 'urql';

import { Channels, ChannelsProps } from '@/components/Channels';
import { ChannelsPageDocument, useQuery } from '@/hooks/api';
import { pagesPath } from '@/libs/$path';
import { useRouter } from '@/libs/router';

type UiProps = Omit<ChannelsProps, 'sideNavStyle'>;
const Ui: React.FC<UiProps> = ({ children, ...rest }) => (
  <>
    <Box
      display={{ base: rest.activeChId ? 'none' : 'block', md: 'block' }}
      w={{ base: '80%', md: '20%' }}
      maxW={'250px'}
    >
      <Channels
        {...rest}
        sideNavStyle={{
          padding: 2,
          height: 'calc(100vh - 5.75rem)',
          overflowY: 'auto',
          position: 'sticky',
          borderRight: '1px solid',
          borderColor: 'gray.200',
          top: '64px',
        }}
      />
    </Box>
    <Box flex="1" display={'flex'} flexDirection={'column'}>
      {children}
    </Box>
  </>
);

type ContainerProps = Pick<UiProps, 'activeChId'>;
const Container: NextPage<ContainerProps> = (props) => {
  const router = useRouter();

  const data = useQuery(ChannelsPageDocument);
  const gotoChannel = (id: string) => router.push(pagesPath.channels._id(id).$url());

  if (!data.data) {
    return null;
  }

  const uiProps: UiProps = {
    ...props,
    ...data.data,
    onChannelCreated: gotoChannel,
    onDMChannelCreated: gotoChannel,
  };
  return <Ui {...uiProps} />;
};

gql`
  query ChannelsPage {
    ...Channels_query
  }
`;

export default Container;
export { Ui as ChannelsPageUi };
export type { ContainerProps as ChannelsPageProps, UiProps as ChannelsPageUiProps };
