import { useState } from "react";
import { ArrowLeft, Users, Coins, Plus, Minus, AlertCircle } from "lucide-react";
import styles from "./CreateGroupPage.module.css";

const CreateGroupPage = ({ onBack, userAccount, peerSystemContracts }) => {
    const [formData, setFormData] = useState({
        name: "",
        about: "",
        initialMembers: [""],
        allowDonations: false,
        minDonationAmount: "0",
        treasuryConfig: {
            autoDistribute: false,
            adminShare: "50", // Store as actual percentage
            memberShare: "50", // Store as actual percentage
            minHoldPeriod: "86400", // 1 day in seconds
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleTreasuryConfigChange = (e) => {
        const { name, value, type, checked } = e.target;

        // For percentage inputs, ensure they stay within 0-100
        if (["adminShare", "memberShare"].includes(name)) {
            const numValue = parseInt(value) || 0;
            if (numValue < 0 || numValue > 100) return;
        }

        setFormData(prev => ({
            ...prev,
            treasuryConfig: {
                ...prev.treasuryConfig,
                [name]: type === "checkbox" ? checked : value
            }
        }));
    };

    const handleMemberInputChange = (index, value) => {
        const newMembers = [...formData.initialMembers];
        newMembers[index] = value;
        setFormData(prev => ({
            ...prev,
            initialMembers: newMembers
        }));
    };

    const addMemberField = () => {
        setFormData(prev => ({
            ...prev,
            initialMembers: [...prev.initialMembers, ""]
        }));
    };

    const removeMemberField = (index) => {
        if (formData.initialMembers.length > 1) {
            setFormData(prev => ({
                ...prev,
                initialMembers: prev.initialMembers.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const filteredMembers = formData.initialMembers.filter(m => m.trim() !== "");

            // Convert percentages to basis points (multiply by 100)
            const treasuryConfig = {
                autoDistribute: formData.treasuryConfig.autoDistribute,
                adminShare: parseInt(formData.treasuryConfig.adminShare) * 100, // Convert to basis points
                memberShare: parseInt(formData.treasuryConfig.memberShare) * 100, // Convert to basis points
                minHoldPeriod: parseInt(formData.treasuryConfig.minHoldPeriod),
                lastDistribution: 0
            };

            // Validate total shares equal 100%
            if (parseInt(formData.treasuryConfig.adminShare) + parseInt(formData.treasuryConfig.memberShare) !== 100) {
                throw new Error("Admin and member shares must sum to 100%");
            }

            // Convert minDonationAmount to string to ensure proper handling
            const minDonationAmount = parseInt(formData.minDonationAmount);

            // Debug log
            console.log("Submitting group creation with config:", {
                name: formData.name,
                about: formData.about,
                members: filteredMembers,
                allowDonations: formData.allowDonations,
                minDonationAmount,
                treasuryConfig
            });

            await peerSystemContracts.peerGroups.methods
                .createGroup(
                    formData.name,
                    formData.about,
                    filteredMembers,
                    formData.allowDonations,
                    minDonationAmount,
                    treasuryConfig
                )
                .send({ from: userAccount.address });

            onBack(false);
        } catch (err) {
            console.error("Group creation error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Header section remains the same */}
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => onBack(false)}>
                    <ArrowLeft className={styles.icon} />
                    Back to Groups
                </button>
                <h1 className={styles.title}>Create New Group</h1>
            </div>

            {error && (
                <div className={styles.error}>
                    <AlertCircle className={styles.icon} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Basic Information section remains the same */}
                <div className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>
                        <Users className={styles.icon} />
                        Basic Information
                    </h2>

                    <div className={styles.inputGroup}>
                        <label htmlFor="name">Group Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="about">About Group</label>
                        <textarea
                            id="about"
                            name="about"
                            value={formData.about}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                {/* Members section remains the same */}
                <div className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>Initial Members</h2>
                    {formData.initialMembers.map((member, index) => (
                        <div key={index} className={styles.memberInput}>
                            <input
                                type="text"
                                value={member}
                                onChange={(e) => handleMemberInputChange(index, e.target.value)}
                                placeholder="Member wallet address"
                            />
                            <button
                                type="button"
                                onClick={() => removeMemberField(index)}
                                className={styles.iconButton}
                            >
                                <Minus className={styles.icon} />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addMemberField}
                        className={styles.addButton}
                    >
                        <Plus className={styles.icon} />
                        Add Member
                    </button>
                </div>

                {/* Updated Treasury Settings section */}
                <div className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>
                        <Coins className={styles.icon} />
                        Treasury Settings
                    </h2>

                    <div className={styles.inputGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="allowDonations"
                                checked={formData.allowDonations}
                                onChange={handleInputChange}
                            />
                            Allow Donations
                        </label>
                    </div>

                    {formData.allowDonations && (
                        <>
                            <div className={styles.inputGroup}>
                                <label htmlFor="minDonationAmount">Minimum Donation Amount</label>
                                <input
                                    type="number"
                                    id="minDonationAmount"
                                    name="minDonationAmount"
                                    value={formData.minDonationAmount}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        name="autoDistribute"
                                        checked={formData.treasuryConfig.autoDistribute}
                                        onChange={handleTreasuryConfigChange}
                                    />
                                    Auto-distribute Donations
                                </label>
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="adminShare">Admin Share (%)</label>
                                <input
                                    type="number"
                                    id="adminShare"
                                    name="adminShare"
                                    value={formData.treasuryConfig.adminShare}
                                    onChange={handleTreasuryConfigChange}
                                    min="0"
                                    max="100"
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="memberShare">Member Share (%)</label>
                                <input
                                    type="number"
                                    id="memberShare"
                                    name="memberShare"
                                    value={formData.treasuryConfig.memberShare}
                                    onChange={handleTreasuryConfigChange}
                                    min="0"
                                    max="100"
                                />
                            </div>

                            <div className={styles.note}>
                                Note: Admin and member shares must sum to 100%
                            </div>
                        </>
                    )}
                </div>

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isLoading || (formData.allowDonations &&
                        (parseInt(formData.treasuryConfig.adminShare) + parseInt(formData.treasuryConfig.memberShare) !== 100))}
                >
                    {isLoading ? "Creating Group..." : "Create Group"}
                </button>
            </form>
        </div>
    );
};

export default CreateGroupPage;