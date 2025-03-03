class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async updateBalanceDefault(userId, amount) {
        return await this.userRepository.updateBalanceDefault(userId, amount);
    }

    async updateBalancePessimistic(userId, amount) {
        return await this.userRepository.updateBalancePessimistic(userId, amount);
    }

    async updateBalanceOptimistic(userId, amount) {
        return await this.userRepository.updateBalanceOptimistic(userId, amount);
    }
}

export default UserService;
