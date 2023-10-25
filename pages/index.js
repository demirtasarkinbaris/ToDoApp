import ConnectWalletButton from "./components/ConnectWalletButton";
import TodoList from "./components/TodoList";
import TaskContractABI from "./abi/abi.json";
import { ethers } from "ethers";
import { useState, useEffect } from "react";

/* 
const tasks = [
  { id: 0, taskText: 'clean', isDeleted: false }, 
  { id: 1, taskText: 'food', isDeleted: false }, 
  { id: 2, taskText: 'water', isDeleted: true }
]
*/

const TaskContractAddress = "0x29F7976cAA0Ef9e0aE9c1e841A4DEEb2C535fF29";

export default function Home() {
	const [accounts, setAccounts] = useState([]);
	const isConnected = Boolean(accounts[0]);
	const [input, setInput] = useState("");
	const [tasks, setTasks] = useState([]);

	useEffect(() => {
		connectWallet();
		getAllTasks();
	}, []);

	// Calls Metamask to connect wallet on clicking Connect Wallet button
	const connectWallet = async () => {
		try {
			if (window.ethereum) {
				const accounts = await window.ethereum.request({
					method: "eth_requestAccounts",
				});
				setAccounts(accounts);
			}
		} catch (error) {
			console.log(error);
		}
	};

	// Just gets all the tasks from the contract
	const getAllTasks = async () => {
		try {
			if (window.ethereum) {
				const provider = new ethers.providers.Web3Provider(window.ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(
					TaskContractAddress,
					TaskContractABI,
					signer
				);
				let allTasks = await contract.getMyTasks();
				setTasks(allTasks);
			}
		} catch (error) {
			console.log(error);
		}
	};

	// Add tasks from front-end onto the blockchain
	const addTask = async (e) => {
		e.preventDefault();

		let task = {
			taskText: input,
			isDeleted: false,
		};

		try {
			if (window.ethereum) {
				const provider = new ethers.providers.Web3Provider(window.ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(
					TaskContractAddress,
					TaskContractABI,
					signer
				);

				contract
					.addTask(task.taskText, task.isDeleted)
					.then((res) => {
						setTasks([...tasks, task]);
					})
					.catch((err) => {
						console.log(err);
					});
			} else {
				console.log("object does not exist!");
			}
		} catch (error) {
			console.log(error);
		}
		setInput("");
	};

	// Remove tasks from front-end by filtering it out on our "back-end" / blockchain smart contract
	const deleteTask = (key) => async () => {
		try {
			if (window.ethereum) {
				const provider = new ethers.providers.Web3Provider(window.ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(
					TaskContractAddress,
					TaskContractABI,
					signer
				);
				const deleteTaskTX = await contract.deleteTask(key, true);
				console.log(deleteTaskTX);
				let allTasks = await contract.getMyTasks();
				setTasks(allTasks);
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className="bg-[#97b5fe] h-screen w-screen flex justify-center py-6">
			{!isConnected ? (
				<ConnectWalletButton connectWallet={connectWallet} />
			) : (
				<TodoList
					tasks={tasks}
					input={input}
					setInput={setInput}
					addTask={addTask}
					deleteTask={deleteTask}
				/>
			)}
		</div>
	);
}
