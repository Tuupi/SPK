// Define the criteria and their weights
const criteria = [
    { name: 'Cost', weight: 0.3, type: 'min' },
    { name: 'Quality', weight: 0.4, type: 'max' },
    { name: 'Delivery Time', weight: 0.3, type: 'min' },
    { name: 'something', weight: 0.2, type: 'max'}
  ];
  
  // Define the alternatives and their performances for each criterion
  const alternatives = [
    { name: 'Alternative 1', performances: [100, 8, 10, 5] },
    { name: 'Alternative 2', performances: [120, 7, 8, 5] },
    { name: 'Alternative 3', performances: [90, 9, 12, 7] }
  ];
  
  // Define the preference function for each criterion
  function getPreference(a, b, criterion) {
    const difference = a - b;
    if (criterion.type === 'max') {
      if (difference > 0) {
        return difference;
      } else {
        return 0;
      }
    } else {
      if (difference < 0) {
        return -difference;
      } else {
        return 0;
      }
    }
  }
  
  // Calculate the leaving flow, entering flow, and net flow for each alternative
  function calculateFlows(alternatives, criteria) {
    alternatives.forEach(alternative => {
      let leavingFlow = 0;
      let enteringFlow = 0;
  
      criteria.forEach(criterion => {
        alternatives.forEach(other => {
          if (other !== alternative) {
            leavingFlow += getPreference(alternative.performances[criteria.indexOf(criterion)], other.performances[criteria.indexOf(criterion)], criterion) * criterion.weight;
            enteringFlow += getPreference(other.performances[criteria.indexOf(criterion)], alternative.performances[criteria.indexOf(criterion)], criterion) * criterion.weight;
          }
        });
      });
  
      alternative.leavingFlow = leavingFlow / (alternatives.length - 1);
      alternative.enteringFlow = enteringFlow / (alternatives.length - 1);
      alternative.netFlow = alternative.leavingFlow - alternative.enteringFlow;
    });
  }
  
  // Rank the alternatives based on their net flows
  function rankAlternatives(alternatives) {
    alternatives.sort((a, b) => b.netFlow - a.netFlow);
    return alternatives;
  }
  
  // Create the decision support system
  function createDecisionSupportSystem(criteria, alternatives) {
    calculateFlows(alternatives, criteria);
    const rankedAlternatives = rankAlternatives(alternatives);
  
    return {
      getAlternatives: () => alternatives,
      getCriteria: () => criteria,
      getRanking: () => rankedAlternatives
    };
  }
  
  // Example usage
  const decisionSupport = createDecisionSupportSystem(criteria, alternatives);
  console.log(decisionSupport.getRanking());