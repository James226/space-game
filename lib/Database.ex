require Amnesia
use Amnesia

defdatabase Database do
	#We define a table, records will be sorted, the first element will be taken as an index
	deftable Voxel, [:position, :status], type: :ordered_set do
		#Nice to have, we declare a struct that represents a record in the database
		@type t :: %Voxel{position: String.t, status: List.t}
	end
end
