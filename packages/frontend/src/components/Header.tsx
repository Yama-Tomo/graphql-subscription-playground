import React from 'react';
import { Box, Center, Flex, Heading } from '@chakra-ui/react';

const Ui = () => (
  <Box
    as="header"
    color="gray.50"
    bg="teal.400"
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
