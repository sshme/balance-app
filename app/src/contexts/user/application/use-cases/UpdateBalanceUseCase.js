class UpdateBalanceUseCase {
    constructor(updateBalanceStrategy) {
        this.updateBalanceStrategy = updateBalanceStrategy;
    }

    async execute(updateBalanceDTO) {
        const {userId, amount} = updateBalanceDTO;
        return await this.updateBalanceStrategy(userId, amount);
    }
}

export default UpdateBalanceUseCase;
