import axios from 'axios';
import '@testing-library/jest-dom';

jest.mock('axios');
axios.create = jest.fn(() => axios);
