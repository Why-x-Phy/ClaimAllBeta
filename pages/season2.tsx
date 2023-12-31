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
import NFTCard from "../components/NFTCardSeason2";
import {
  nftDropSeason2,
  stakingSeason2,
  tokenContractAddress,
} from "../consts/contractAddresses";


const Home: NextPage = () => {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

    const address = useAddress();
    const { contract: nftDropContract } = useContract(
      nftDropSeason2,
      "nft-drop"
    );
    const { contract: tokenContract } = useContract(
      tokenContractAddress,
      "token"
    );
    const { contract, isLoading } = useContract(stakingSeason2);
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
  

  async function stakeNfts(ids: string[]) {
    if (!address) return;

    const isApproved = await nftDropContract?.isApproved(
      address,
      stakingSeason2
    );
    if (!isApproved) {
      await nftDropContract?.setApprovalForAll(stakingSeason2, true);
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
       
        
        
        <h1 className={styles.h1}>Angry Animals Season 2 is completed</h1>
  
        <hr className={`${styles.smallDivider} ${styles.detailPageHr}`} />
  
        <p className={styles.explain}>
        
        <b>Unreveal and Reveal Mint is completed</b>
         <br /><br /> 
         <b>Season 3 Mint is opened</b>
        </p>
        
        <hr className={`${styles.smallDivider} ${styles.detailPageHr}`} />
  
  
        
  
        {/* <div className={styles.quantityContainer}>
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
          contractAddress={nftDropSeason2}
          action={(contract) => contract.erc721.claim(quantity)}
          onSuccess={() => {
            setQuantity(1);
            
          }}
          onError={(error) => {
            
          }}
        >
          Mint An NFT
        </Web3Button>*/}
        <br /><br /> 
        </p>

        <p className={styles.staking}> 
        <h1 className={styles.h1}>Stake Your Season 2 NFTs</h1>
        <hr className={`${styles.divider} ${styles.spacerTop}`} />
  


          <>
            <h2>Your Tokens</h2>
            <div className={styles.tokenGrid}>
              <div className={styles.tokenItem}>
                <h3 className={styles.tokenLabel}>Claimable Rewards</h3>
                <p className={styles.tokenValue}>
                  <b>
                    {!claimableRewards
                      ? ""
                      
                      : Number(ethers.utils.formatUnits(claimableRewards, 18)).toFixed(2)} 
                  </b>{" "}
                  {tokenBalance?.symbol}
                </p>
              </div>
              <div className={styles.tokenItem}>
                <h3 className={styles.tokenLabel}>Current Balance</h3>
                <p className={styles.tokenValue}>
                  <b>{tokenBalance?.displayValue !== undefined ? parseFloat(tokenBalance.displayValue).toFixed(2) : ""}
                    </b> {tokenBalance?.symbol}
                </p>
              </div>
            </div>
  
            <Web3Button
              className={styles.wallet}
              action={(contract) => contract.call("claimRewards")}
              contractAddress={stakingSeason2}
            >
              Claim Rewards
            </Web3Button>
  
            <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <h2>Your Staked NFTs</h2>

          <Web3Button
        className={styles.wallet}
        contractAddress={stakingSeason2}
        action={() => withdrawNfts(selectedNftsToWithdraw)}
        isDisabled={selectedNftsToWithdraw.length === 0}
      >
        Unstake Selected NFTs
      </Web3Button>

          <div className={styles.nftBoxGrid}>
            {stakedTokens &&
              stakedTokens[0]?.map((stakedToken: BigNumber) => (
                <div
                  className={`${styles.nftBox} ${
                    selectedNftsToWithdraw.includes(stakedToken.toString())
                      ? styles.selected
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
            contractAddress={stakingSeason2}
            action={() => stakeNfts(selectedNfts)}
            isDisabled={selectedNfts.length === 0}
            >
            Stake Selected NFTs
          </Web3Button>

          <div className={styles.nftBoxGrid}>
            {ownedNfts?.map((nft) => (
              <div
                className={`${styles.nftBox} ${
                  selectedNfts.includes(nft.metadata.id) ? styles.selected : ""
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
                  className={styles.nftMedia}
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
