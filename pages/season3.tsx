import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import { useMemo, useState, useEffect } from "react";

import {
  ConnectWallet,
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useContractRead,
  useOwnedNFTs,
  useTokenBalance,
  Web3Button,
} from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import NFTCard from "../components/NFTCardSeason3";
import {
  nftDropSeason3,
  stakingSeason3,
  stakingSeason2,
  stakingSeason1,
  tokenContractAddress,
} from "../consts/contractAddresses";


const Home: NextPage = () => {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

    const address = useAddress();
    const { contract: nftDropContract } = useContract(
      nftDropSeason3,
      "nft-drop"
    );
    const { contract: tokenContract } = useContract(
      tokenContractAddress,
      "token"
    );
    const { contract, isLoading } = useContract(stakingSeason3);
    const { data: ownedNfts } = useOwnedNFTs(nftDropContract, address);
    const { data: tokenBalance } = useTokenBalance(tokenContract, address);
    const [claimableRewards, setClaimableRewards] = useState<BigNumber>();
    const { data: stakedTokens } = useContractRead(contract, "getStakeInfo", [
      address,
    ]);
    const [selectedNfts, setSelectedNfts] = useState<string[]>([]);
    const [selectedNftsToWithdraw, setSelectedNftsToWithdraw] = useState<string[]>([]);
  
    useEffect(() => {
      if (!contract || !address) return;
  
      async function loadClaimableRewards() {
        const stakeInfo = await contract?.call("getStakeInfo", [address]);
        setClaimableRewards(stakeInfo[1]);
      }
  
      loadClaimableRewards();
    }, [address, contract]);

    const stakingSeason1Contract = useContract(stakingSeason1).contract;
    const stakingSeason2Contract = useContract(stakingSeason2).contract;
    const stakingSeason3Contract = useContract(stakingSeason3).contract;

    async function claimAllRewards() {
      const claimPromises = [];
    
      if (stakingSeason1Contract) {
        // Add promise to claim rewards for Season 1
        claimPromises.push(stakingSeason1Contract.call("claimRewards"));
      }
    
      if (stakingSeason2Contract) {
        // Add promise to claim rewards for Season 2
        claimPromises.push(stakingSeason2Contract.call("claimRewards"));
      }
    
      if (stakingSeason3Contract) {
        // Add promise to claim rewards for Season 3
        claimPromises.push(stakingSeason3Contract.call("claimRewards"));
      }
    
      // Wait for all claim promises to resolve
      await Promise.all(claimPromises);
    }
    
  

  async function stakeNfts(ids: string[]) {
    if (!address) return;

    const isApproved = await nftDropContract?.isApproved(
      address,
      stakingSeason3
    );
    if (!isApproved) {
      await nftDropContract?.setApprovalForAll(stakingSeason3, true);
    }
    await contract?.call("stake", [ids]);
    setSelectedNfts([]);  // clear the selected NFTs after staking
  }

if (isLoading) {
    
    return (
      
      <div className={styles.loading}>      
      </div>
    )
  }

  async function withdrawNfts(ids: string[]) {
    if (!address) return;
    await contract?.call("withdraw", [ids]);
    setSelectedNftsToWithdraw([]);
  }

  


    return (
      <div className={styles.container}>
          <div
          className={styles.optionSelectBack}
          role="button"
          onClick={() => router.push(`/`)}
        >
          {/* Mint a new NFT */}
          <h2 className={styles.selectBoxTitleBack}>Back to Dashboard</h2>
        </div>
        <p className={styles.minting}> 



        <br /><br />
        
        <ConnectWallet btnTitle="Connect Wallet" className={styles.wallet} />
       
        
        
        <h1 className={styles.h1}>Mint Nightbear Platoon NFTs</h1>
  
        <hr className={`${styles.smallDivider} ${styles.detailPageHr}`} />
  
        <p className={styles.explain}>
         <b>Phase 1 Unreveal Mint</b> costs 1 NFT <b>5 Matic</b> and goes until August 31th.
         <br /><br /> 
         <b>Phase 2 Reveal Mint</b> costs 1 NFT <b>10 Matic</b> and runs until September 30th.
         
         <br /><br /> 
        </p>
        <hr className={`${styles.smallDivider} ${styles.detailPageHr}`} />
  
  
        
  
        <div className={styles.quantityContainer}>
                      <button
                        className={`${styles.quantityControlButton}`}
                        onClick={() => setQuantity(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
  
                      <h4>{quantity}</h4>
  
                      <button
                        className={`${styles.quantityControlButton}`}
                        onClick={() => setQuantity(quantity + 1)}
                        
                      >
                        +
                      </button>
                    </div>
  
                    
  
        <Web3Button
          className={styles.wallet}
          contractAddress={nftDropSeason3}
          action={(contract) => contract.erc721.claim(quantity)}
          onSuccess={() => {
            setQuantity(1);
            
          }}
          onError={(error) => {
            
          }}
        >
          Mint An NFT
        </Web3Button>
        <br /><br /> 
        </p>

        <p className={styles.staking}> 
        <h1 className={styles.h1}>Stake Your NFTs</h1>
        <hr className={`${styles.divider} ${styles.spacerTop}`} />
  


          <>
            <h2>Your Tokens</h2>
            <div className={styles.tokenGrid}>
              <div className={styles.tokenItem}>
                <h3 className={styles.tokenLabel}>Claimable Rewards</h3>
                <p className={styles.tokenValue}>
                  <b>
                    {!claimableRewards
                      ? "Loading..."
                      : Number(ethers.utils.formatUnits(claimableRewards, 18)).toFixed(2)} 
                  </b>{" "}
                  {tokenBalance?.symbol}
                </p>
              </div>
              <div className={styles.tokenItem}>
                <h3 className={styles.tokenLabel}>Current Balance</h3>
                <p className={styles.tokenValue}>
                <b>{tokenBalance?.displayValue !== undefined ? parseFloat(tokenBalance.displayValue).toFixed(2) : ""}</b> {tokenBalance?.symbol}
                </p>
              </div>
            </div>
  
            <Web3Button
              className={styles.wallet}
              action={(contract) => contract.call("claimRewards")}
              contractAddress={stakingSeason3}
            >
              Claim Rewards
            </Web3Button>

            <hr className={`${styles.divider} ${styles.spacerTop}`} />

                        {/* Mint All Season`s Button */}
            <Web3Button
              className={styles.wallet}
              contractAddress={stakingSeason3} // Verwenden Sie die Vertragsadresse von Season 3
              action={claimAllRewards}
            >
              Claim Season 1-3 Rewards
            </Web3Button>
            
  
            <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <h2>Your Staked NFTs</h2>

          <Web3Button
        className={styles.wallet}
        contractAddress={stakingSeason3}
        action={() => withdrawNfts(selectedNftsToWithdraw)}
        isDisabled={selectedNftsToWithdraw.length === 0}
      >
        Unstake Selected NFTs
      </Web3Button>

          <div className={styles.nftBoxGrid}>
            {stakedTokens &&
              stakedTokens[0]?.map((stakedToken: BigNumber) => (
                <div
                  className={`${styles.nftBoxSeason3} ${
                    selectedNftsToWithdraw.includes(stakedToken.toString())
                      ? styles.selectedSeason3
                      : ""
                  }`}
                  key={stakedToken.toString()}
                  onClick={() => {
                    setSelectedNftsToWithdraw((prevSelectedNfts) => {
                      const tokenId = stakedToken.toString();
                      if (prevSelectedNfts.includes(tokenId)) {
                        return prevSelectedNfts.filter((id) => id !== tokenId);
                      } else {
                        return [...prevSelectedNfts, tokenId];
                      }
                    });
                  }}
                >
                  <NFTCard tokenId={stakedToken.toNumber()} />
                </div>
              ))}
          </div>



          <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <h2>Your Unstaked NFTs</h2>

          <Web3Button
            className={styles.wallet}
            contractAddress={stakingSeason3}
            action={() => stakeNfts(selectedNfts)}
            isDisabled={selectedNfts.length === 0}
            >
            Stake Selected NFTs
          </Web3Button>

          <div className={styles.nftBoxGrid}>
            {ownedNfts?.map((nft) => (
              <div
                className={`${styles.nftBoxSeason3} ${
                  selectedNfts.includes(nft.metadata.id) ? styles.selectedSeason3 : ""
                }`}
                key={nft.metadata.id.toString()}
                onClick={() => {
                  setSelectedNfts((prevSelectedNfts) => {
                    if (prevSelectedNfts.includes(nft.metadata.id)) {
                      return prevSelectedNfts.filter(
                        (id) => id !== nft.metadata.id
                      );
                    } else {
                      return [...prevSelectedNfts, nft.metadata.id];
                    }
                  });
                }}
              >
                <ThirdwebNftMedia
                  metadata={nft.metadata}
                  className={styles.nftMediaSeason3}
                />
                <h3>{nft.metadata.name}</h3>
              </div>
            ))}
          </div>
        </>
       

          </p>
      </div>
    );

    
  };
  
  export default Home;
