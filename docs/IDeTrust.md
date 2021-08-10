## `IDeTrust`

## Struct
### Trust
        uint id;  // the id of the trust
        string name;  // the name of the trust, like 'Alice's trust by her dad'
        address settlor;  // the address of the settlor, who put money into the trust
        address beneficiary; // the address of the beneficiary, ppl the money give to
        uint startReleaseTime; // when will the trust begin to release
        uint timeInterval;  // how often can the beneficiary get money
        uint amountPerTimeInterval;  // how much can the beneficiary get every time
        uint lastReleaseTime;  // the last timestamp the beneficiary get money
        uint totalAmount;  // how much money of a trust holds

## Functions



    /*
     * Get the balance in this contract, which is not send to any trust
     * @return the balance of the settlor in this contract
     */
### `getBalance() → uint256 balance` (external)




    /*
     * If money is send to this contract by accident, can use this
     * function to get money back ASAP.
     *
     * @param to the address money would send to
     * @param amount how much money are added into the trust
     */
### `sendBalanceTo(address to, uint256 amount)` (external)




    /*
     * Get beneficiary's all trusts
     *
     * @param account the account of the beneficiary
     * @return array of trusts which's beneficiary is the tx.orgigin
     */
### `getTrustListAsBeneficiary(address account) → struct IDeTrust.Trust[]` (external)




    /*
     * Get settlor's all trusts
     *
     * @param account the account of the trust
     * @return array of trusts which's settlor is the tx.orgigin
     */
### `getTrustListAsSettlor(address account) → struct IDeTrust.Trust[]` (external)




    /*
     * Add a new trust from settlor's balance in this contract.
     *
     * @param name the trust's name
     * @param beneficiary the beneficiary's address to receive the trust fund
     * @param startReleaseTime the start time beneficiary can start to get money,
                               UTC seconds
     * @param timeInterval how often the beneficiary can get money
     * @param amountPerTimeInterval how much money can beneficiary get after one timeInterval
     * @param totalAmount how much money is added to the trust
     */
### `addTrustFromBalance(string name, address beneficiary, uint256 startReleaseTime, uint256 timeInterval, uint256 amountPerTimeInterval, uint256 totalAmount) → uint256 trustId` (external)




    /*
     * Add a new trust by pay
     *
     * @param name the trust's name
     * @param beneficiary the beneficiary's address to receive the trust fund
     * @param startReleaseTime the start time beneficiary can start to get money,
                               UTC seconds
     * @param timeInterval how often the beneficiary can get money
     * @param amountPerTimeInterval how much money can beneficiary get after one timeInterval
     */
### `addTrust(string name, address beneficiary, uint256 startReleaseTime, uint256 timeInterval, uint256 amountPerTimeInterval) → uint256 trustId` (external)



    /*
     * Set trust to irrevocable
     *
     * @param trustId the trustId settlor want to set irrevocable
     */
### `setIrrevocable(uint trustId)` external


    /*
     * Revoke a trust, withdraw all the money out
     *
     * @param trustId the trustId settlor want to revoke
     */
### `revoke(uint trustId)` external



    /*
     * Top up a trust by payment
     * @param trustId the trustId settlor want to top up
     */
### `topUp(uint256 trustId)` (external)



    /*
     * Top up from balance to a trust by trustId
     *
     * @param trustId the trustId settlor want add to top up
     * @param amount the amount of money settlor want to top up
     */
### `topUpFromBalance(uint256 trustId, uint256 amount)` (external)




    /*
     * Beneficiary release one trust asset by this function
     *
     * @param trustId the trustId beneficiary want to release
     *
     */
### `release(uint256 trustId)` (external)




    /*
     * Beneficiary release one trust asset by this function
     *
     * @param trustId the trustId beneficiary want to release
     * @param to the address beneficiary want to release to
     *
     */
### `releaseTo(uint256 trustId, address to)` (external)




    /*
     * Beneficiary get token by this function, release all the
     * trust releaeable assets in the contract
     */
### `releaseAll()` (external)



    /*
     * Beneficiary get token by this function, release all the
     * trust releaeable assets in the contract
     *
     * @param to the address beneficiary want to release to
     */
### `releaseAllTo(address to)` (external)



## Events


    /*
     * Event that a new trust is added
     *
     * @param name the name of the trust
     * @param settlor the settlor address of the trust
     * @param beneficiary the beneficiary address of the trust
     * @param trustId the trustId of the trust
     * @param startReleaseTime will this trust start to release money, UTC in seconds
     * @param timeInterval how often can a beneficiary to get the money in seconds
     * @param amountPerTimeInterval how much can a beneficiary to get the money
     * @param totalAmount how much money are put in the trust
     */
### `TrustAdded(string name, address settlor, address beneficiary, uint256 trustId, uint256 startReleaseTime, uint256 timeInterval, uint256 amountPerTimeInterval, uint256 totalAmount)`




    /*
     * Event that new fund are added into a existing trust
     *
     * @param trustId the trustId of the trust
     * @param amount how much money are added into the trust
     */
### `TrustFundAdded(uint256 trustId, uint256 amount)`




    /*
     * Event that a trust is finished
     *
     * @param trustId the trustId of the trust
     */
### `TrustFinished(uint256 trustId)`




    /*
     * Event that a trust is releaseed
     *
     * @param trustId the trustId of the trust
     */
### `event TrustReleased(uint indexed trustId, address indexed beneficiary, uint amount, uint nextReleaseTime)`




    /*
     * Event that a trust is revoked
     *
     * @param trustId the trustId of the trust
     */
### `event TrustRevoked(uint indexed trustId)`




    /*
     * Event that beneficiary get some money from the contract
     *
     * @param beneficiary the address of beneficiary
     * @param totalAmount how much the beneficiary released from this contract
     */
### `Release(address beneficiary, uint256 totalAmount)`
