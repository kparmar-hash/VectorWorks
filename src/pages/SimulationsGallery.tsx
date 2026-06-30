import { Layout } from '../components/layout/Layout';
import { SimulationFrame } from '../components/lesson/SimulationFrame';
import { SIMULATION_REGISTRY } from '../simulations/registry';
import { CURRICULUM } from '../content/curriculum';

// Build a flat list of all simulation sections from the curriculum, deduped by componentKey
function getAllSimulations() {
  const seen = new Set<string>();
  const sims: { moduleTitle: string; lessonTitle: string; componentKey: string; title: string; description?: string }[] = [];
  for (const mod of CURRICULUM.modules) {
    for (const lesson of mod.lessons) {
      for (const section of lesson.sections) {
        if (section.type === 'simulation' && !seen.has(section.componentKey)) {
          seen.add(section.componentKey);
          sims.push({
            moduleTitle: mod.shortTitle,
            lessonTitle: lesson.title,
            componentKey: section.componentKey,
            title: section.title,
            description: section.description,
          });
        }
      }
    }
  }
  return sims;
}

export function SimulationsGallery() {
  const simulations = getAllSimulations();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Simulations</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          All interactive simulations, standalone. Change parameters and watch the physics update in real time.
        </p>

        {simulations.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 text-sm">No simulations available yet.</p>
        ) : (
          <div className="space-y-8">
            {simulations.map((sim) => {
              const SimComponent = SIMULATION_REGISTRY[sim.componentKey];
              if (!SimComponent) return null;
              return (
                <div key={sim.componentKey}>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                    {sim.moduleTitle} › {sim.lessonTitle}
                  </div>
                  <SimulationFrame title={sim.title} description={sim.description}>
                    <SimComponent />
                  </SimulationFrame>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
