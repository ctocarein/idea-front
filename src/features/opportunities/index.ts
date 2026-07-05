/** Feature opportunities — marketplace B2B scopée au projet du porteur. Barrel. */
export { OpportunityCard } from "./components/OpportunityCard";
export { getOpportunities, type Opportunity } from "./api";
export { expressInterest } from "./actions";
// Back-office (admin) : catalogue curé.
export { OpportunitiesAdminClient } from "./OpportunitiesAdminClient";
export { getAdminOpportunities, type OpportunityAdminOut } from "./adminApi";
