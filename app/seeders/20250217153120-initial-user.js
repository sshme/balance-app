'use strict';

export const up = async ({context: queryInterface}) => {
    await queryInterface.bulkInsert('users', [{
        balance: 10000,
        createdAt: new Date(),
        updatedAt: new Date()
    }], {});
};

export const down = async ({context: queryInterface}) => {
    await queryInterface.bulkDelete('users', null, {});
};
