import { Icon, IconProps } from '@chakra-ui/react';
import { BsCardList } from 'react-icons/bs';
import { FaArrowAltCircleRight } from 'react-icons/fa';
import { MdAddCircleOutline, MdMoreVert, MdPersonAdd, MdSend } from 'react-icons/md';

type Props = Omit<IconProps, 'as'>;
const MoreVert = (props: Props) => <Icon as={MdMoreVert} {...props} />;
const AddCircleOutline = (props: Props) => <Icon as={MdAddCircleOutline} {...props} />;
const PersonAdd = (props: Props) => <Icon as={MdPersonAdd} {...props} />;
const Send = (props: Props) => <Icon as={MdSend} {...props} />;
const ArrowAltCircleRight = (props: Props) => <Icon as={FaArrowAltCircleRight} {...props} />;
const CardList = (props: Props) => <Icon as={BsCardList} {...props} />;

export { MoreVert, AddCircleOutline, PersonAdd, Send, ArrowAltCircleRight, CardList };
