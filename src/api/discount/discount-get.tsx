import api from '../api';
import { DiscountCodeResponse } from '@/types/interfaces';

export const getActiveDiscountCodes = async (): Promise<DiscountCodeResponse> => {
  try {
    const response = await api.getAnonymApiRoot
      .discountCodes()
      .get({
        queryArgs: {
          where: [
            'isActive = true',
            `validUntil > "${new Date().toISOString()}" or validUntil is not defined`,
          ].join(' and '),
        },
      })
      .execute();

    console.log(response);

    const codes = response.body.results.map((code) => ({
      code: code.code,
      name: code.name?.en,
      description: code.description?.en,
      validUntil: code.validUntil,
    }));

    return { response, codes };
  } catch (error) {
    console.error('Error fetching discount codes:', error);
    return { codes: [] };
  }
};
