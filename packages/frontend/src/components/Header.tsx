import { Box, Center, Flex, Heading } from '@chakra-ui/react';
import React from 'react';

const Ui = () => (
  <Box
    as="header"
    color="gray.50"
    bg="brand"
    justifyContent="center"
    borderColor="gray.300"
    borderBottomWidth="1px"
    position="sticky"
    top={0}
    zIndex="sticky"
  >
    <Box p={2} height={'56px'}>
      <Flex height={'100%'} justifyContent="center">
        <Center flex="1">
          <Heading size="md">GraphQL subscription playground</Heading>
        </Center>
      </Flex>
    </Box>
  </Box>
);

export { Ui as Header };
