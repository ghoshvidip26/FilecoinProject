import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyTokenModule", (m) => {
  // Deploy the MyToken contract using msg.sender (the deployer) as the initialOwner
  const myToken = m.contract("MyToken", [m.getAccount(0)]);

  return { myToken };
});
