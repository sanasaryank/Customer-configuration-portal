    1. Customers
        List:
            Columns:
                id, sortable
                name, sortable, filter
                group, sortable, filter
                productTypes, sortable, filter //
                status, sortable, filter
                isBlocked, sortable
                lastUpdate, sortable
                Action buttons: Edit, Block, History 
    
    2. Products
        List:
            Columns:
                id, sortable
                groupName, sortable, filter
                name, sortable, filter
                isBlocked, sortable
                Action buttons: Edit,  Block, History 
    3. History	
        List:
            Columns:
                date, sortable, filter
                username, sortable, filter
                objectType, sortable, filter
                action, sortable, filter
                Action buttons: View 
    4. Dictionaries
        Employees, IntegrationTypes, RestaurantTypes, HotelTypes, MenuTypes, PriceSegments, ProductGroups, CustomerGroups, Countries
            List:
                Columns:
                    id, sortable
                    name, sortable, filter
                    isBlocked, sortable
                    Action buttons: Edit,  Block, History 
        Cities
            List:
                Columns:
                    id, sortable
                    countryName, sortable, filter
                    name, sortable, filter
                    isBlocked, sortable
                    Action buttons: Edit,  Block, History 
        Districts
            List:
                Columns:
                    id, sortable
                    cityName, sortable, filter
                    name, sortable, filter
                    isBlocked, sortable
                    Action buttons: Edit,  Block, History 