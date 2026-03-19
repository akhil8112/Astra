import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

const challenges = ['Sensory Issues', 'Communication', 'Social Skills', 'Routine Management'];
const ages = ['Toddler (1-3)', 'Preschool (3-5)', 'School-Age (6-12)'];

const FilterSidebar = ({ filters, setFilters }) => {
    return (
        <aside className="space-y-6 sticky top-24">
            <div>
                <Label htmlFor="search" className="text-lg font-semibold mb-2 block">Search</Label>
                <Input
                    id="search"
                    placeholder="Search by keyword..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                />
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-3">Challenges</h3>
                <div className="flex flex-wrap gap-2">
                    {challenges.map(challenge => (
                        <Button
                            key={challenge}
                            size="sm"
                            variant={filters.challenge === challenge ? 'default' : 'outline'}
                            onClick={() => setFilters(prev => ({ ...prev, challenge: prev.challenge === challenge ? '' : challenge, page: 1 }))}
                        >
                            {challenge}
                        </Button>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-3">Age Group</h3>
                <div className="flex flex-wrap gap-2">
                    {ages.map(age => (
                        <Button
                            key={age}
                            size="sm"
                            variant={filters.age === age ? 'default' : 'outline'}
                            onClick={() => setFilters(prev => ({ ...prev, age: prev.age === age ? '' : age, page: 1 }))}
                        >
                            {age}
                        </Button>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default FilterSidebar;